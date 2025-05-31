
export interface Event {
  id: string;
  time: string | number | Date;
  title: string;
  description: string;
  schedule: string;
  joiners?: string | number;
  payment?: string;
  avatar?: string;
  timezone?: string;
  onClick?: () => void;
}
