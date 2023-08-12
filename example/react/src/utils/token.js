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

// eslint-disable-next-line import/no-anonymous-default-export
export default new Token()
