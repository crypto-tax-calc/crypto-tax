export const addLeadingZeros = (number: number, maxNumberOfDigits: number): string => {
  return number.toString().padStart(maxNumberOfDigits, '0')
}

export const randomString = (maxLength: number): string => {
  return (Math.random() + 1).toString(36).substring(maxLength)
}
