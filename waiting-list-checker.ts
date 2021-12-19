import axios from 'axios';
import { createClient } from '@supabase/supabase-js'
import querystring from 'querystring'

const supabaseUrl = 'https://ecsxaprxkvyoolvvobsn.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const QISCUS_APP_ID = process.env.QISCUS_APP_ID;
const QISCUS_APP_SECRET = process.env.QISCUS_SECRET_KEY;

const GET_AVAILABLE_AGENTS = async () => {
  let agent_to_assign = []
  let available_agents = await axios.get('https://multichannel.qiscus.com/api/v1/admin/agents', {
      headers: {
          'Qiscus-App-Id': QISCUS_APP_ID,
          'Qiscus-Secret-Key': QISCUS_APP_SECRET
      }
  }).then((response) => {
      return response.data.data.agents.data;
  })
  available_agents = available_agents.filter(agent => agent.is_available && agent.current_customer_count < 2 )
  if (available_agents.length > 0) {
    const waiting_customers =  await GET_WAITING_CUSTOMERS();
    if (waiting_customers.length > 0) {
      available_agents.map((agent) => {
        const customer_to_assign = 2 - agent.current_customer_count;
        for (let i = 0; i < customer_to_assign; i++) {
          agent_to_assign.push(agent.id)
        }
      });
      agent_to_assign.map(async (agent,index) => {
        if (waiting_customers[index]) {
          const assigned = await ASSIGN_AGENT(agent,waiting_customers[index].room_id);
          if (assigned) {
            console.log(`assigned ${agent} to ${waiting_customers[index].room_id}`)
            const {data} = await supabase
              .from('queues')
              .delete()
              .match({ room_id: waiting_customers[index].room_id});
            if (data) return console.log('deleted');
          }
        }
      })
    } else {
      return console.log('No Waiting Customers')
    }
  } else {
    return console.log('No Available Agents')
  }
}

const GET_WAITING_CUSTOMERS = async () => {
  const {data: waiting_customers} = await supabase
    .from('queues')
    .select('*')
    .match({ is_resolved: false })
  return waiting_customers;
}
  
const ASSIGN_AGENT = async (agentId, roomId) => {
    const assigned = await axios.post('https://multichannel.qiscus.com/api/v1/admin/service/assign_agent',
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
    .then((response) => response)
    .catch((err) => err);
    return assigned;
}

await GET_AVAILABLE_AGENTS();