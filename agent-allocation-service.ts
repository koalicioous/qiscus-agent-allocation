import axios from 'axios';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ecsxaprxkvyoolvvobsn.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const QISCUS_APP_ID = process.env.QISCUS_APP_ID;
const QISCUS_APP_SECRET = process.env.QISCUS_SECRET_KEY;
const BASE_URL = process.env.BASE_URL;

const GET_AVAILABLE_AGENTS = async () => {
  let available_agents = await axios.get('https://multichannel.qiscus.com/api/v1/admin/agents', {
      headers: {
          'Qiscus-App-Id': process.env.QISCUS_APP_ID,
          'Qiscus-Secret-Key': process.env.QISCUS_SECRET_KEY
      }
  }).then((response) => {
      return response.data.data.agents.data;
  })
  available_agents = available_agents.filter(agent => agent.is_available && agent.current_customer_count < 2 )
}

const ASSIGN_AGENT = async () => {

}

const res = await GET_AVAILABLE_AGENTS();
return res;