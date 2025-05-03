
import { User } from "../types";

export const useUserDemoService = () => {
  const createDemoUsers = async (): Promise<User[]> => {
    console.log("La création d'utilisateurs de démonstration est désactivée.");
    return [];
  };
  
  return { createDemoUsers };
};
