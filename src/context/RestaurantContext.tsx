import { createContext, useContext, useEffect, useState } from "react";
import { RestaurantGstProfile } from "../types/types";

interface restaurantContextType{
    restaurantGstProfile: RestaurantGstProfile | null,
    updateRestaurantGstProfile: (profile: RestaurantGstProfile)=>void
}

const RestaurantContext = createContext<restaurantContextType>({
    restaurantGstProfile: null,
    updateRestaurantGstProfile: (profile: RestaurantGstProfile) => {} 
});

const RestaurantProvider:React.FC<{children:React.ReactNode}> = ({children}) => {
    const [restaurantGstProfile, setRestaurantGstProfile] = useState<RestaurantGstProfile | null>(null);

    useEffect(()=>{
        // TODO: api call to fetch restaurantProfileInfo via service.ts
        setRestaurantGstProfile({
            restaurantName: 'Hush Dine & Lounge',
                  legalBusinessName: 'Hush Hospitality Private Limited',
                  gstin: '27AAPCH1234F1Z5',
                  fssaiNumber: '12345678901234',
                  pan: 'AAPCH1234F',
                  address: 'Level 4, Zenith Towers, Senapati Bapat Marg, Lower Parel',
                  state: 'Maharashtra',
                  stateCode: '27',
                  pincode: '400013',
                  phoneNumber: '+91 98765 43210',
                  email: 'billing@hushdine.com',
                  invoicePrefix: 'INV-2026',
                  financialYear: '2026-27',
                  taxConfig: 'BOTH'
        });
    }, []);


    const updateRestaurantGstProfile = (profile: RestaurantGstProfile) => {
        // TODO CALL API via service.ts to update profile.
    };

    return <RestaurantContext.Provider value={{restaurantGstProfile, updateRestaurantGstProfile}}>
        {children}
    </RestaurantContext.Provider>
}

const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if(context === undefined){
        throw new Error('useRestaurant must be used within an RestaurantProvider');
    }
    return context;
};

export {RestaurantProvider, useRestaurant};