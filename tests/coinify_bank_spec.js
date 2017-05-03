let proxyquire = require('proxyquireify')(require);

let Address = obj => ({street: obj.street});

let stubs = {
  './address': Address
};

let CoinifyBank = proxyquire('../src/coinify-bank', stubs);
let o;
let address;

beforeEach(function () {
  JasminePromiseMatchers.install();

  address = {
    street: '221B Baker Street'
  };

  o = {
    id: 'id',
    account: {
      type: 'type',
      currency: 'currency',
      bic: 'bic',
      number: 'number'
    },
    bank: {
      name: 'Banky McBankface',
      address
    },
    holder: {
      address
    },
    referenceText: 'referenceText',
    updateTime: 'updateTime',
    createTime: 'createTime'
  };
});

afterEach(() => JasminePromiseMatchers.uninstall());

describe('Coinify: Bank account', function () {
  describe('constructor', () =>
    it('coinify reference must be preserved', function () {
      let b = new CoinifyBank(o);
      expect(b._id).toBe(o.id);
      expect(b._type).toBe(o.account.type);
      expect(b._currency).toBe(o.account.currency);
      expect(b._bic).toBe(o.account.bic);
      expect(b._number).toBe(o.account.number);

      // expect(b._bank_name).toBe(o.bank.name);
      expect(b._holder_name).toBe(o.holder.name);
      expect(b._bank_address.street).toEqual(o.bank.address.street);
      expect(b._holder_name).toBe(o.holder.name);
      expect(b._holder_address.street).toEqual(o.holder.address.street);
      // expect(b._referenceText).toBe(o.referenceText);

      expect(b._updated_at).toBe(o.updateTime);
      expect(b._created_at).toBe(o.createTime);
    })
  );

  describe('instance', function () {
    let b;
    beforeEach(() => {
      b = new CoinifyBank(o);
    });

    it('has getters', function () {
      expect(b.type).toBe(o.account.type);
      expect(b.currency).toBe(o.account.currency);
      expect(b.bic).toBe(o.account.bic);
      expect(b.number).toBe(o.account.number);

      // expect(b.bankName).toBe(o.bank.name);
      expect(b.bankAddress.street).toEqual(o.bank.address.street);
      expect(b.holderName).toBe(o.holder.name);
      expect(b.holderAddress.street).toEqual(o.holder.address.street);
      // expect(b.referenceText).toBe(o.referenceText);
    });
  });
});
