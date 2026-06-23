const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const app = require('../server');

test('fluxo principal da API de lideranca', async () => {
  const server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, resolve);
  });

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  const email = `lider-${Date.now()}@teste.local`;

  try {
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lider Teste',
        email,
        role: 'Gestor',
        company: 'Empresa Teste',
        password: 'segredo123',
      }),
    });
    assert.equal(registerResponse.status, 201);
    const registerData = await registerResponse.json();
    assert.ok(registerData.devCode);

    const verifyResponse = await fetch(`${baseUrl}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        code: registerData.devCode,
      }),
    });
    assert.equal(verifyResponse.status, 200);

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'segredo123',
      }),
    });
    assert.equal(loginResponse.status, 200);
    const loginData = await loginResponse.json();
    assert.ok(loginData.token);
    assert.equal(loginData.user.email, email);

    const stateResponse = await fetch(
      `${baseUrl}/api/app-state?email=${encodeURIComponent(email)}`
    );
    assert.equal(stateResponse.status, 200);
    const stateData = await stateResponse.json();
    assert.equal(stateData.profile.email, email);
    assert.ok(Array.isArray(stateData.tracks));
    assert.ok(Array.isArray(stateData.actionPlan));
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }
});
