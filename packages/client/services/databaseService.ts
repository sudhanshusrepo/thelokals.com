import { supabase } from './supabase';

const setupNewUserTrigger = async () => {
    // Check if the function already exists
    const { data: functions, error: f_error } = await supabase
        .rpc('run_sql', { sql: "SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';" });

    if (f_error) {
        console.error("Error checking for function:", f_error.message);
        return;
    }
    
    // If function doesn't exist, create it.
    if (!functions || (Array.isArray(functions) && functions.length === 0)) {
        const { error: func_error } = await supabase.rpc('run_sql', { 
            sql: `
                CREATE OR REPLACE FUNCTION public.handle_new_user()
                RETURNS TRIGGER AS $$
                BEGIN
                    INSERT INTO public.customers (id, full_name, email)
                    VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
                    RETURN new;
                END;
                $$ LANGUAGE plpgsql SECURITY DEFINER;
            `
        });
        if (func_error) {
            console.error('Error creating function:', func_error.message);
            return;
        }
    }

    // Check if trigger exists
    const { data: triggers, error: t_error } = await supabase
        .rpc('run_sql', { sql: "SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';" });
    
     if (t_error) {
        console.error("Error checking for trigger:", t_error.message);
        return;
    }

    // If trigger doesn't exist, create it.
    if (!triggers || (Array.isArray(triggers) && triggers.length === 0)) {
        const { error: trig_error } = await supabase.rpc('run_sql', {
            sql: `
                CREATE TRIGGER on_auth_user_created
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
            `
        });
        if (trig_error) console.error('Error creating trigger:', trig_error.message);
    }
};

const removeInsertPolicy = async () => {
    // List all policies on the 'customers' table
    const { data, error } = await supabase.rpc('run_sql', {
        sql: "SELECT policyname FROM pg_policies WHERE tablename = 'customers' AND cmd = 'INSERT';"
    });

    if (error) {
        console.error("Error checking for policies:", error.message);
        return;
    }

    // If a policy named "Allow individual insert access" exists, drop it.
    if (data && Array.isArray(data) && data.some((p: any) => p.policyname === 'Allow individual insert access')) {
         const { error: drop_error } = await supabase.rpc('run_sql', {
            sql: `DROP POLICY "Allow individual insert access" ON public.customers;`
        });
         if (drop_error) console.error('Error dropping policy:', drop_error.message);
    }
}


export const databaseService = {
  setupNewUserTrigger,
  removeInsertPolicy
};
