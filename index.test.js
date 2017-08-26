/* eslint-env mocha */
const Eos = require('.')

if(process.env['NODE_ENV'] === 'development') {// avoid breaking travis-ci

  describe('networks', () => {
    it('testnet', (done) => {
      eos = Eos.Testnet()
      eos.getBlock(1, (err, block) => {
        if(err) {
          throw err
        }
        done()
      })
    })
  })

  describe('transactions', () => {

    const wif = '5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3'

    const signProvider = ({sign, buf}) => sign(buf, wif)
    const promiseSigner = (args) => Promise.resolve(signProvider(args))

    it('usage', () => {
      eos = Eos.Testnet({signProvider})
      eos.transfer()
    })

    it('newaccount', () => {
      eos = Eos.Testnet({signProvider})
      const pubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'
      const auth = {threshold: 1, keys: [{key: pubkey, weight: 1}], accounts: []}
      const name = 'acct' + String(Math.round(Math.random() * 100000)).replace(/[0,6-9]/g, '')

      return eos.newaccount({
        creator: 'inita',
        name,
        owner: pubkey,
        active: pubkey,
        recovery: pubkey,
        deposit: '10 EOS'
      })
    })

    it('transfer (broadcast)', () => {
      eos = Eos.Testnet({signProvider})
      return eos.transfer('inita', 'initb', 1)
    })

    it('transfer (no broadcast)', () => {
      eos = Eos.Testnet({signProvider})
      return eos.transfer('inita', 'initb', 1, {broadcast: false})
    })

    it('transfer sign promise (no broadcast)', () => {
      eos = Eos.Testnet({signProvider: promiseSigner})
      return eos.transfer('inita', 'initb', 1, false)
    })

    it('custom transfer', () => {
      eos = Eos.Testnet({signProvider})
      return eos.transaction({
        scope: ['inita', 'initb'],
        messages: [
          {
            code: 'eos',
            type: 'transfer',
            data: {
              from: 'inita',
              to: 'initb',
              amount: '13'
            },
            authorization: [{
              account: 'inita',
              permission: 'active'
            }]
          }
        ],
        broadcast: false
      })
    })

  })

} // if development