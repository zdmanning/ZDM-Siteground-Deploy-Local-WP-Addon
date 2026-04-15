/**
 * WizardContainer
 *
 * State machine for the 8-step profile creation wizard.
 * All wizard state lives here. Each step receives:
 *   { data, onChange, onNext, onBack, onCancel }
 *
 * Step map (0-indexed internally, shown as 1-8 in the UI):
 *   0  Step1_Intro            – What this add-on does
 *   1  Step2_SGPrep           – Go to SiteGround first
 *   2  Step3_ConnectionInfo   – Collect SSH credentials (validated form)
 *   3  Step4_KeyGen           – Generate Ed25519 key pair locally
 *   4  Step5_PublicKey        – Display + copy public key, paste into SiteGround
 *   5  Step6_TestConnection   – Verify SSH connection works
 *   6  Step7_SaveProfile      – Review summary and save
 *   7  Step8_Complete         – Done — offer to go to deploy or profile view
 */

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StepIndicator from '../components/StepIndicator';
import Step1_Intro from './steps/Step1_Intro';
import Step2_SGPrep from './steps/Step2_SGPrep';
import Step3_ConnectionInfo from './steps/Step3_ConnectionInfo';
import Step4_KeyGen from './steps/Step4_KeyGen';
import Step5_PublicKey from './steps/Step5_PublicKey';
import Step6_TestConnection from './steps/Step6_TestConnection';
import Step7_SaveProfile from './steps/Step7_SaveProfile';
import Step8_Complete from './steps/Step8_Complete';

const TOTAL_STEPS = 8;

function makeInitialData(site) {
  return {
    // Profile identity — assigned on save
    id: null,

    // Key identity — pre-assigned so keygen can reference it before save
    keyId: uuidv4(),

    // Form fields
    name: '',
    sshHost: '',
    sshPort: 18765,
    sshUser: '',
    remoteWebRoot: '/home/customer/www/',


    // Runtime state set during the wizard — never entered by the user
    localSiteId: site ? site.id : null,
    publicKey: null,           // set by Step4 after generation
    connectionTestPassed: false, // set by Step6
  };
}

export default function WizardContainer({ site, onComplete, onGoToDeploy, onCancel }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(() => makeInitialData(site));

  function onChange(partial) {
    setData((prev) => ({ ...prev, ...partial }));
  }

  function onNext() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }

  function onBack() {
    if (step === 0) {
      onCancel();
    } else {
      setStep((s) => s - 1);
    }
  }

  const stepProps = { data, onChange, onNext, onBack, onCancel };

  const steps = [
    <Step1_Intro       key={0} {...stepProps} />,
    <Step2_SGPrep      key={1} {...stepProps} />,
    <Step3_ConnectionInfo key={2} {...stepProps} />,
    <Step4_KeyGen      key={3} {...stepProps} />,
    <Step5_PublicKey   key={4} {...stepProps} />,
    <Step6_TestConnection key={5} {...stepProps} />,
    <Step7_SaveProfile key={6} {...stepProps} />,
    <Step8_Complete    key={7} {...stepProps} onComplete={onComplete} onGoToDeploy={onGoToDeploy} />,
  ];

  return (
    <div className="sgd-wizard">
      <div className="sgd-wizard__header">
        <StepIndicator total={TOTAL_STEPS} current={step} />
        <p className="sgd-wizard__step-label">Step {step + 1} of {TOTAL_STEPS}</p>
      </div>
      {steps[step]}
    </div>
  );
}
