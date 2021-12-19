import axios from 'axios';
import { createClient } from '@supabase/supabase-js'
import querystring from 'querystring'

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
  if (available_agents.length > 0) {
    await ASSIGN_AGENT(available_agents[0].id, steps.trigger.event.body.room_id)
  } else {
    await ADD_TO_WAITING_LIST(steps.trigger.event.body.room_id)
  }
}

const ASSIGN_AGENT = async (agentId, roomId) => {
  await axios.post('https://multichannel.qiscus.com/api/v1/admin/service/assign_agent',
  querystring.stringify({
      agent_id: agentId,
      room_id: roomId,
  }),{
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Qiscus-App-Id': process.env.QISCUS_APP_ID,
          'Qiscus-Secret-Key': process.env.QISCUS_SECRET_KEY,
      }
  })
  .catch((err) => err);
}

const ADD_TO_WAITING_LIST = async (roomId) => {
  const isWaiting = await supabase
    .from('queues')
    .select('*')
    .match({room_id: roomId}).length === 1;
  if (!isWaiting) {
    const {data: addToWaitingList} = await supabase
      .from('queues')
      .insert([{
        room_id: roomId,
        is_resolved: false,
      }])
  }
}
await GET_AVAILABLE_AGENTS();