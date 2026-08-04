const assert = require('assert');
const { createClient } = require('@supabase/supabase-js');

// 1. Extract and unit-test formatErrorMessage logic from LoginForm.js
const formatErrorMessage = (err) => {
  if (!err) return null;
  const msg = typeof err === 'string' ? err : err.message || '';
  
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Correo o contraseña incorrectos. Por favor verifica tus datos.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
  }
  if (msg.includes('User already registered') || msg.includes('already exists') || msg.includes('user_already_exists')) {
    return 'Ya existe una cuenta registrada con este correo electrónico.';
  }
  if (msg.includes('Password should be at least') || msg.includes('weak_password')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('invalid email') || msg.includes('Unable to validate email')) {
    return 'Por favor ingresa un correo electrónico válido.';
  }
  return msg || 'Ocurrió un error durante la autenticación. Intenta de nuevo.';
};

function runUnitTests() {
  console.log('--- Running Unit Tests for formatErrorMessage ---');

  // Test 1: Null/undefined
  assert.strictEqual(formatErrorMessage(null), null);
  assert.strictEqual(formatErrorMessage(undefined), null);

  // Test 2: Invalid login credentials
  assert.strictEqual(
    formatErrorMessage({ message: 'Invalid login credentials' }),
    'Correo o contraseña incorrectos. Por favor verifica tus datos.'
  );
  assert.strictEqual(
    formatErrorMessage('invalid_credentials'),
    'Correo o contraseña incorrectos. Por favor verifica tus datos.'
  );

  // Test 3: Email not confirmed
  assert.strictEqual(
    formatErrorMessage({ message: 'Email not confirmed' }),
    'Debes confirmar tu correo electrónico antes de iniciar sesión.'
  );

  // Test 4: User already registered
  assert.strictEqual(
    formatErrorMessage({ message: 'User already registered' }),
    'Ya existe una cuenta registrada con este correo electrónico.'
  );
  assert.strictEqual(
    formatErrorMessage({ message: 'User already exists' }),
    'Ya existe una cuenta registrada con este correo electrónico.'
  );
  assert.strictEqual(
    formatErrorMessage('user_already_exists'),
    'Ya existe una cuenta registrada con este correo electrónico.'
  );

  // Test 5: Short / weak password
  assert.strictEqual(
    formatErrorMessage({ message: 'Password should be at least 6 characters' }),
    'La contraseña debe tener al menos 6 caracteres.'
  );
  assert.strictEqual(
    formatErrorMessage('weak_password'),
    'La contraseña debe tener al menos 6 caracteres.'
  );

  // Test 6: Invalid email
  assert.strictEqual(
    formatErrorMessage({ message: 'Unable to validate email address: invalid format' }),
    'Por favor ingresa un correo electrónico válido.'
  );
  assert.strictEqual(
    formatErrorMessage('invalid email'),
    'Por favor ingresa un correo electrónico válido.'
  );

  // Test 7: Generic / unmapped message
  assert.strictEqual(
    formatErrorMessage({ message: 'Over_Email_Send_Rate_Limit' }),
    'Over_Email_Send_Rate_Limit'
  );

  // Test 8: Empty error object or empty string
  assert.strictEqual(
    formatErrorMessage({}),
    'Ocurrió un error durante la autenticación. Intenta de nuevo.'
  );

  console.log('✅ ALL 8 Unit Tests PASSED!');
}

async function runIntegrationTestsWithSupabase() {
  console.log('\n--- Running Integration Tests with Live Supabase Endpoints ---');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vcpeghsekglbwsolntvo.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_KPX6N5hqzwNQ2R_TC3r8YQ_EkJA25GR';

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Case A: Test Invalid Login Credentials
  console.log('Testing Supabase signInWithPassword with wrong credentials...');
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: 'nonexistent_test_user_12345@example.com',
    password: 'WrongPassword123!',
  });
  console.log('  Supabase response:', loginError?.message);
  const formattedLoginErr = formatErrorMessage(loginError);
  console.log('  Formatted Spanish error:', formattedLoginErr);
  assert.strictEqual(
    formattedLoginErr,
    'Correo o contraseña incorrectos. Por favor verifica tus datos.'
  );
  console.log('✅ Case A PASSED!');

  // Case B: Test Short Password in Sign Up
  console.log('\nTesting Supabase signUp with short password (5 chars)...');
  const { error: signUpShortErr } = await supabase.auth.signUp({
    email: `shortpass_test_${Date.now()}@example.com`,
    password: '12345',
  });
  console.log('  Supabase response:', signUpShortErr?.message);
  const formattedShortPassErr = formatErrorMessage(signUpShortErr);
  console.log('  Formatted Spanish error:', formattedShortPassErr);
  assert.strictEqual(
    formattedShortPassErr,
    'La contraseña debe tener al menos 6 caracteres.'
  );
  console.log('✅ Case B PASSED!');

  // Case C: Test Invalid Email Format in Sign Up
  console.log('\nTesting Supabase signUp with invalid email format...');
  const { error: signUpInvalidEmailErr } = await supabase.auth.signUp({
    email: 'invalid-email-format-without-at',
    password: 'ValidPassword123!',
  });
  console.log('  Supabase response:', signUpInvalidEmailErr?.message);
  const formattedInvalidEmailErr = formatErrorMessage(signUpInvalidEmailErr);
  console.log('  Formatted Spanish error:', formattedInvalidEmailErr);
  assert.strictEqual(
    formattedInvalidEmailErr,
    'Por favor ingresa un correo electrónico válido.'
  );
  console.log('✅ Case C PASSED!');
}

async function main() {
  try {
    runUnitTests();
    await runIntegrationTestsWithSupabase();
    console.log('\n=============================================');
    console.log('🎉 ALL EMPIRICAL VERIFICATION TESTS PASSED!');
    console.log('=============================================\n');
  } catch (err) {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exit(1);
  }
}

main();
