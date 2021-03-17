export const formatValidationErrors = (errorsInstance) => {
  if (errorsInstance.isEmpty()) {
    return false;
  }
  const errors = errorsInstance.array();
  const formattedErrors = {};
  errors.forEach((error) => {
    formattedErrors[error.param] = {
      id: error.param,
      href: '#' + error.param,
      value: error.value,
      text: error.msg
    };
  });
  return formattedErrors;
};
