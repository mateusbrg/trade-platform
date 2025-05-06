import express, { Request, Response } from 'express';
import crypto from 'crypto';
import pgp from 'pg-promise';
import { validateCpf } from './validateCpf';
import axios from 'axios';

const app = express();
app.use(express.json());

// const accounts: any = [];
const connection = pgp()('postgres://postgres:123456@localhost:5432/app');

function isValidName(name: string) {
  return name.match(/[a-zA-Z] [a-zA-Z]+/);
}

function isValidEmail(email: string) {
  return email.match(/^(.+)\@(.+)$/);
}

function isValidPassword(password: string) {
  if (password.length < 8) return false;
  if (!password.match(/\d+/)) return false;
  if (!password.match(/[a-z]+/)) return false;
  if (!password.match(/[A-Z]+/)) return false;
  return true;
}

app.post('/signup', async (req: Request, res: Response) => {
  const input = req.body;
  if (!isValidName(input.name)) {
    return res.status(422).json({
      error: 'Invalid name',
    });
  }
  if (!isValidEmail(input.email)) {
    return res.status(422).json({
      error: 'Invalid email',
    });
  }
  if (!validateCpf(input.document)) {
    return res.status(422).json({
      error: 'Invalid document',
    });
  }
  //todo: avoid plaintext here!
  if (!isValidPassword(input.password)) {
    return res.status(422).json({
      error: 'Invalid password',
    });
  }
  const accountId = crypto.randomUUID();
  const account = {
    accountId,
    name: input.name,
    email: input.email,
    document: input.document,
    password: input.password,
  };
  // accounts.push(account);
  await connection.query(
    'insert into ccca.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)',
    [
      account.accountId,
      account.name,
      account.email,
      account.document,
      account.password,
    ]
  );
  res.json({ accountId });
});

// todo: return status code correctly
app.get('/accounts/:accountId', async (req: Request, res: Response) => {
  const accountId = req.params.accountId;
  // const account = accounts.find((account: any) => account.accountId === accountId);
  const [accountData] = await connection.query(
    'select * from ccca.account where account_id = $1',
    [accountId]
  );

  if (!accountData) {
    return res.status(404).json({
      // todo: correct code here?
      error: 'Account not found',
    });
  }
  res.json(accountData);
});

app.post('/deposit', async (req: Request, res: Response) => {
  const { accountId, assetId, quantity } = req.body;
  const accountOutput = await axios.get(
    `http://localhost:3000/accounts/${accountId}`
  );

  if (accountOutput.data.error) {
    return res.status(422).json({
      error: 'Invalid accountId',
    });
  }

  if (assetId !== 'BTC' && assetId !== 'USD') {
    return res.status(422).json({
      error: 'Invalid assetId',
    });
  }

  await connection.query(
    `INSERT INTO ccca.account_asset (account_id, asset_id, quantity)
   VALUES ($1, $2, $3)
   ON CONFLICT (account_id, asset_id)
   DO UPDATE SET quantity = ccca.account_asset.quantity + EXCLUDED.quantity`,
    [accountId, assetId, quantity]
  );

  return res.json({ status: 'ok' }).status(200);
});

app.get('/health', async (req, res) => {
  return res.json({ status: 'ok' });
});

app.listen(3000);
