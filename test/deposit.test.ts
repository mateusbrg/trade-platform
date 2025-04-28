import axios from 'axios';

axios.defaults.validateStatus = () => true;

const BASE_URL = 'http://localhost:3000'; //todo: put this on axios client singleton

test('Deve adicionar fundos a uma conta', async () => {
  const inputDeposit = {
    accountId: 'RANDOM_UUID',
    assetId: 'RANDOM_ASSET_ID',
    quantity: 10,
  };

  const { status } = await axios.post(`${BASE_URL}/deposit`, inputDeposit);

  expect(status).toBe(200);
  // todo: talvez verificar se o saldo realmente foi atualizado.
});

test('A conta deve existir', async () => {
  const inputDeposit = {
    accountId: 'RANDOM_UUID',
    assetId: 'RANDOM_ASSET_ID',
    quantity: 10,
  };

  const { data: userAccount, status } = await axios.get(
    `${BASE_URL}/accounts/${inputDeposit.accountId}`
  );

  expect(status).toBe(200);
  expect(userAccount).toBeDefined();
});
