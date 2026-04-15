'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');
const { app } = require('electron');

const localAdapter = require('../adapters/local-app');

function _ok(data)   { return { success: true, data }; }
function _err(error) { return { success: false, error }; }

function _runExecFile(file, args) {
  return new Promise((resolve) => {
    execFile(file, args, { windowsHide: true, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      resolve({
        exitCode: typeof error?.code === 'number' ? error.code : 0,
        stdout: stdout || '',
        stderr: stderr || '',
        error,
      });
    });
  });
}

function _siteRunRoot(siteId) {
  return path.join(app.getPath('userData'), '..', 'Local', 'run', siteId);
}

function _siteMysqlConfigPath(siteId) {
  return path.join(_siteRunRoot(siteId), 'conf', 'mysql', 'my.cnf');
}

function _siteMysqlPidPath(siteId) {
  return path.join(_siteRunRoot(siteId), 'mysql', 'data', 'Workhorse.pid');
}

async function _getMysqlProcesses() {
  const script = [
    "Get-CimInstance Win32_Process -Filter \"name='mysqld.exe'\"",
    '| Select-Object ProcessId, CommandLine',
    '| ConvertTo-Json -Compress',
  ].join(' ');

  const res = await _runExecFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script]);
  if (res.exitCode !== 0 || !res.stdout.trim()) return [];

  try {
    const parsed = JSON.parse(res.stdout.trim());
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (_) {
    return [];
  }
}

async function _getTcpListeners() {
  const res = await _runExecFile('netstat', ['-ano', '-p', 'tcp']);
  if (res.exitCode !== 0) return [];

  return res.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts.length >= 5 && parts[0] === 'TCP' && parts[3] === 'LISTENING')
    .map((parts) => {
      const endpoint = parts[1];
      const lastColon = endpoint.lastIndexOf(':');
      return {
        localAddress: lastColon !== -1 ? endpoint.slice(0, lastColon) : endpoint,
        port: lastColon !== -1 ? endpoint.slice(lastColon + 1) : '',
        pid: parts[4],
      };
    });
}

function _portsForPid(listeners, pid) {
  return listeners
    .filter((listener) => String(listener.pid) === String(pid))
    .map((listener) => String(listener.port));
}

function _commandMatchesSite(commandLine, siteId) {
  if (!commandLine) return false;
  const normalized = String(commandLine).replace(/\\/g, '/').toLowerCase();
  return normalized.includes(`/run/${String(siteId).toLowerCase()}/conf/mysql/my.cnf`);
}

async function repairSiteMysql(siteId) {
  if (!siteId) return _err('A Local site ID is required.');
  if (os.platform() !== 'win32') {
    return _err('The Local MySQL repair action is currently supported on Windows only.');
  }

  const site = localAdapter.getSite(siteId);
  if (!site) return _err(`Could not find the linked Local site "${siteId}".`);

  const expectedPort = localAdapter.getSiteMysqlPort(siteId);
  if (!expectedPort) {
    return _err('Could not determine the site\'s current MySQL port from Local\'s live config.');
  }

  const pidPath = _siteMysqlPidPath(siteId);
  const processes = await _getMysqlProcesses();
  const listeners = await _getTcpListeners();

  const siteProcesses = processes
    .filter((proc) => _commandMatchesSite(proc.CommandLine, siteId))
    .map((proc) => ({
      pid: proc.ProcessId,
      commandLine: proc.CommandLine || '',
      ports: _portsForPid(listeners, proc.ProcessId),
    }));

  const expectedListening = listeners.some((listener) => String(listener.port) === String(expectedPort));
  const staleProcesses = siteProcesses.filter((proc) => proc.ports.length > 0 && !proc.ports.includes(String(expectedPort)));

  if (siteProcesses.some((proc) => proc.ports.includes(String(expectedPort)))) {
    return _ok({
      status: 'healthy',
      siteId,
      siteName: site.name,
      expectedPort: String(expectedPort),
      stalePorts: [],
      killedPids: [],
      pidFileRemoved: false,
      needsRestart: false,
      message: `Local MySQL is already healthy on port ${expectedPort}.`,
    });
  }

  const killedPids = [];
  for (const proc of staleProcesses) {
    await _runExecFile('taskkill', ['/PID', String(proc.pid), '/F']);
    killedPids.push(String(proc.pid));
  }

  let pidFileRemoved = false;
  if (fs.existsSync(pidPath)) {
    try {
      fs.unlinkSync(pidPath);
      pidFileRemoved = true;
    } catch (err) {
      return _err(`Failed to remove the stale Workhorse.pid file: ${err.message}`);
    }
  }

  const stalePorts = [...new Set(staleProcesses.flatMap((proc) => proc.ports))];
  const repaired = stalePorts.length > 0 || pidFileRemoved;

  return _ok({
    status: repaired ? 'repaired' : 'no-op',
    siteId,
    siteName: site.name,
    expectedPort: String(expectedPort),
    stalePorts,
    killedPids,
    pidFileRemoved,
    needsRestart: !expectedListening,
    message: repaired
      ? `Cleared stale MySQL state for ${site.name}. Start the site again and Local should launch MySQL on port ${expectedPort}.`
      : `No stale MySQL process was found for ${site.name}. If the site still fails to start, fully quit and reopen Local before trying again.`,
  });
}

module.exports = {
  repairSiteMysql,
};