export const testHas6Characters = (password: string) => password.length >= 6
export const testHasOneLetter = (password: string) => {
  const regex = /^[a-z]/i
  return regex.test(password)
}
