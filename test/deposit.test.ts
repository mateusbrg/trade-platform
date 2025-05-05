import axios from 'axios';

axios.defaults.validateStatus = () => true;

const BASE_URL = 'http://localhost:3000'; //todo: put this on axios client singleton

test('Deve adicionar fundos a uma conta', async () => {
  const inputSignup = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  };
  const responseSignup = await axios.post(
    'http://localhost:3000/signup',
    inputSignup
  );

  const inputDeposit = {
    accountId: responseSignup.data.accountId,
    assetId: 'BTC',
    quantity: 10,
  };
  const { status } = await axios.post(`${BASE_URL}/deposit`, inputDeposit);
  expect(status).toBe(200);
  // todo: talvez verificar o saldo
});

test('A conta deve existir', async () => {
  const inputSignup = {
    name: 'John Doe',
    email: 'john.doe@gmail.com',
    document: '97456321558',
    password: 'asdQWE123',
  };
  const responseSignup = await axios.post(
    'http://localhost:3000/signup',
    inputSignup
  );

  const responseGetAccount = await axios.post(
    `http://localhost:3000/accounts/${responseSignup.data.accountId}`
  );

  expect(responseGetAccount.data).toBeDefined(); // todo: assim?
});
