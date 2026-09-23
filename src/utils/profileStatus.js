function getApplicationStatus(user) {
  const hasVehicle = !!user.rcFileUrl;

  const insuranceComplete =
    user.claimedPrevious === 'no' ||
    !!user.previousPolicyUrl;

  const hasPersonal =
    !!user.name &&
    !!user.email &&
    !!user.dob;

  const hasKyc =
    !!user.aadhaarFrontUrl &&
    !!user.aadhaarBackUrl &&
    !!user.panUrl;

  const hasNominee =
    !!user.nomineeName &&
    !!user.nomineeRelationship &&
    !!user.nomineeDob &&
    !!user.nomineeMobile;

  const isComplete =
    hasVehicle &&
    insuranceComplete &&
    hasPersonal &&
    hasKyc &&
    hasNominee;

  let nextStep = 'Home';

  if (!hasVehicle || !insuranceComplete) {
    nextStep = 'Vehicle';
  } else if (!hasPersonal) {
    nextStep = 'Personal';
  } else if (!hasKyc) {
    nextStep = 'Kyc';
  } else if (!hasNominee) {
    nextStep = 'Nominee';
  }

  const isFirstTime =
    !user.rcFileUrl &&
    !user.previousPolicyUrl &&
    !user.aadhaarFrontUrl &&
    !user.aadhaarBackUrl &&
    !user.panUrl;

  return {
    isComplete,
    nextStep,
    isFirstTime,
    needsReferralPrompt:
      isFirstTime &&
      !user.referralPrompted,

    completed: {
      vehicle: hasVehicle,
      insurance: insuranceComplete,
      personal: hasPersonal,
      kyc: hasKyc,
      nominee: hasNominee,
    },
  };
}

module.exports = {
  getApplicationStatus,
};