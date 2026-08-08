import { WaiterRequest } from "../types/types";

// Waiter summoning triggered by Guest/Customer
const triggerCallWaiter = (type: WaiterRequest['type'], label: string, tableNumber: number, setAllWaiterRequests: React.Dispatch<any>) => {
    const reqId = `req-${Date.now()}`;
        const newRequest: WaiterRequest = {
          id: reqId,
          type,
          label,
          tableNumber,
          status: 'requested',
        };
    
        setAllWaiterRequests((prev: any) => [...prev, newRequest]);
    
        // Simulate auto-assigned waiter background flow for active guest visual transitions
        setTimeout(() => {
          setAllWaiterRequests((currentList: any) => {
            return currentList.map((req: any) => {
              if (req.id === reqId && req.status === 'requested') {
                const waiters = ['Alex Thorne', 'Yuki Sato', 'Elena Rostova', 'Devi Patel', 'James Sinclair'];
                const randomWaiter = waiters[Math.floor(Math.random() * waiters.length)];
                return {
                  ...req,
                  status: 'assigned',
                  waiterName: randomWaiter,
                  etaString: '1 min',
                };
              }
              return req;
            });
          });
        }, 2500);
    
        setTimeout(() => {
          setAllWaiterRequests((currentList: any) => {
            return currentList.map((req: any) => {
              if (req.id === reqId && req.status === 'assigned') {
                return {
                  ...req,
                  status: 'on_the_way',
                  etaString: '30 sec',
                };
              }
              return req;
            });
          });
        }, 5500);
    
        setTimeout(() => {
          setAllWaiterRequests((currentList: any) => {
            return currentList.map((req: any) => {
              if (req.id === reqId && req.status === 'on_the_way') {
                return {
                  ...req,
                  status: 'resolved',
                };
              }
              return req;
            });
          });
        }, 12000);
};

 const cancelWaiterRequest = (tableNumber: number,setAllWaiterRequests: CallableFunction, setWaiterRequest: CallableFunction) => {
     // Remove or resolve it
    setAllWaiterRequests((prev:any) => prev.filter((r:any) => r.tableNumber !== tableNumber));
    setWaiterRequest(null);
 };

  // Staff explicit assignments
 const assignWaiterToCall = (requestId: string, waiterName: string, setAllWaiterRequests: CallableFunction) => {
    setAllWaiterRequests((prev: any) =>
      prev.map((r: any) =>
        r.id === requestId
          ? { ...r, status: 'assigned', waiterName, etaString: 'Inside Dining Area' }
          : r
      )
    );
 };
   

const  resolveWaiterCall = (requestId: string, setAllWaiterRequests: CallableFunction) => {
     setAllWaiterRequests((prev:any) => prev.filter((r:any) => r.id !== requestId));
};

export {triggerCallWaiter, cancelWaiterRequest, assignWaiterToCall, resolveWaiterCall};