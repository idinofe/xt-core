export class Token {
  token: string | null = null

  set (token: string | null) {
    if (typeof token === 'string') {
      this.token = token
    }
  }

  get () {
    return this.token
  }
}

export default new Token()
