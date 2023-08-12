export class Token {
  token = null

  set (token) {
    if (typeof token === 'string') {
      this.token = token
    }
  }

  get () {
    return this.token
  }
}

export default new Token()
