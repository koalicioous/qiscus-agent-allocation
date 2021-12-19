# qiscus-agent-allocation

## Brief explanation on how this service works:
1. This service is deployed on Pipedreams to utilize serverless function feature.
2. Pipedream provides an endpoint as a webhook that recieves event each time unserved customer sends message through qismo widget.
3. The service will allocate the incoming customer to available agent with such condition: available and currently handling < 2 other customers
4. If no agent available, the customer will be added to waiting list in PostgreSQL provided by Supabase.
5. Since there's no configuration to setup webhook to recieve event each time a room is resolved, I scheduled another simple service to check is there any vacant agent every minute. This condition will limit customers' waiting time to maximum 1 minute every time new vacant agent is available.
6. The scheduled job will check is there any vacant agent? if so, is there any waiting customer? if so, then assign available agents to unserved room.

## Service links:
[Available Agent Checker](https://pipedream.com/@suryanegara/available-agent-checker-p_wOCkKdp)
[Custom Agent Allocation](https://pipedream.com/@suryanegara/custom-agent-allocation-p_8rCLYLn)

:)
