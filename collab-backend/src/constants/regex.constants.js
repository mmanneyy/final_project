const REGEX_PATTERNS = {
  EMAIL: /^\S+@\S+\.\S+$/,
  USERNAME: /^[a-z0-9_]+$/,
  // password: at least 8 chars, one letter and one number (example)
  PASSWORD_STRONG: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
};

export default REGEX_PATTERNS;
