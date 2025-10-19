import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { propertiesApi, ordersApi, propertyServicesApi, mediaApi, customersApi } from '../lib/api';
import { Property, Order, PropertyService, Media, Customer } from '../types';

interface AppContextType {
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  propertyServices: PropertyService[];
  setPropertyServices: React.Dispatch<React.SetStateAction<PropertyService[]>>;
  media: Media[];
  setMedia: React.Dispatch<React.SetStateAction<Media[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  isLoading: boolean;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  addProperty: (property: Property) => void;
  updateProperty: (property: Property) => void;
  deleteProperty: (propertyId: string) => void;  
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [propertyServices, setPropertyServices] = useState<PropertyService[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🚀 Cargar data desde el API real
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔄 Loading data from API...');
        const [props, services, ords, custs] = await Promise.all([
          propertiesApi.getAll(),
          propertyServicesApi.getAll(),
          ordersApi.getAll(),
          customersApi.getAll(),
        ]);

        console.log('✅ API data loaded:', { props, services, ords, custs });

        setProperties(props);
        setPropertyServices(services);
        setOrders(ords);
        setCustomers(custs);
      } catch (error) {
        console.error('❌ Failed to load data from API:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        properties,
        setProperties,
        orders,
        setOrders,
        propertyServices,
        setPropertyServices,
        media,
        setMedia,
        customers,
        setCustomers,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
