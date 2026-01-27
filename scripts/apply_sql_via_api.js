
const https = require('https');

const PROJECT_REF = 'gdnltvvxiychrsdzenia';
const PAT = 'sbp_1fe07add23a7109522e91489fdeb8a14c7400a6a';

const sql = `
-- 006_fix_auth_hook.sql
BEGIN;

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  v_claims jsonb;
  v_email text;
  v_admin_role text;
BEGIN
  v_email := event -> 'user' ->> 'email';
  v_claims := event -> 'claims';

  SELECT role INTO v_admin_role
  FROM public.admins
  WHERE email = v_email;

  IF v_admin_role IS NOT NULL THEN
    v_claims := jsonb_set(v_claims, '{user_role}', to_jsonb(v_admin_role)); 
    v_claims := jsonb_set(v_claims, '{role}', to_jsonb('admin'));
    v_claims := jsonb_set(v_claims, '{app_role}', to_jsonb(v_admin_role));
  END IF;

  RETURN v_claims;
END;
$$;

GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT SELECT ON public.admins TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;

COMMIT;
`;

const data = JSON.stringify({
    query: sql
});

const options = {
    hostname: 'api.supabase.com',
    port: 443,
    path: `/v1/projects/${PROJECT_REF}/database/query`, // Corrected Management API endpoint
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAT}`,
        'Content-Length': data.length
    }
};

console.log('🚀 Sending SQL to Supabase Management API...');

const req = https.request(options, (res) => {
    let responseBody = '';

    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ SQL executed successfully!');
        } else {
            console.error('❌ API Error:', responseBody);
            // Verify if path was wrong
            if (res.statusCode === 404) {
                console.log('⚠️ Endpoint not found. Trying legacy PGBouncer/SQL path...');
            }
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Network Error:', error);
});

req.write(data);
req.end();
