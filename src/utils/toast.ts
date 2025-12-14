import { toast } from "sonner";

export const showToast = {
  success: (msg: string) => {
    toast.dismiss();
    toast.success(msg);
  },

  error: (msg: string) => {
    toast.dismiss();
    toast.error(msg);
  },

  warning: (msg: string) => {
    toast.dismiss();
    toast.warning(msg);
  },

  info: (msg: string) => {
    toast.dismiss();
    toast(msg);
  },
};
