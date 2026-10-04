export function validateSignupFields(data) {
  const values = {
    first_name: String(data.get('first_name') ?? '').trim().replace(/\s+/g, ' '),
    last_name: String(data.get('last_name') ?? '').trim().replace(/\s+/g, ' '),
    gender: String(data.get('gender') ?? ''),
    email: String(data.get('email') ?? '').trim(),
  };
  const errors = {};

  if (!values.first_name) errors.first_name = 'Add the name people call you.';
  else if (values.first_name.length > 60) errors.first_name = 'Keep your first name under 60 characters.';
  if (!values.last_name) errors.last_name = 'Add your surname.';
  else if (values.last_name.length > 60) errors.last_name = 'Keep your surname under 60 characters.';
  if (values.gender && !['male', 'female', 'prefer_not_to_say'].includes(values.gender)) errors.gender = 'Choose a listed option.';
  if (!values.email) errors.email = 'Add an email so we can find you when the gate opens.';
  else if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = 'That email doesn’t look quite right. Check it and try again.';

  return { values, errors, valid: Object.keys(errors).length === 0 };
}
