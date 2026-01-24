-- Add UUID v7 generation function
-- RFC 9562 compatible

CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS uuid
AS $$
DECLARE
  v_time timestamp with time zone := clock_timestamp();
  v_unix_t bigint := (extract(epoch from v_time) * 1000)::bigint;
  v_rand bytea := gen_random_bytes(10);
  v_output bytea;
BEGIN
  -- 48-bit timestamp (6 bytes)
  -- Convert millis to hex and decode to bytes, ensuring complete 12 hex chars (6 bytes)
  v_output := decode(lpad(to_hex(v_unix_t), 12, '0'), 'hex');
  
  -- Append 10 random bytes to reach 16 bytes total
  v_output := v_output || v_rand;
  
  -- Set version to 7 (High nibble of Byte 6 = 0111)
  -- Byte 6 is 0-indexed 6th byte (7th byte total)
  -- 112 is 0x70
  v_output := set_byte(v_output, 6, (get_byte(v_output, 6) & 15) | 112);
  
  -- Set variant to RFC 4122 (High 2 bits of Byte 8 = 10)
  -- Byte 8 is 0-indexed 8th byte (9th byte total)
  -- 128 is 0x80, 63 is 0x3F
  v_output := set_byte(v_output, 8, (get_byte(v_output, 8) & 63) | 128);
  
  RETURN encode(v_output, 'hex')::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;
