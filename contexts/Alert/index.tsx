import { createContext, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import type { TypeOptions, Id } from "react-toastify";

export interface AlertContextInterface {
  notify: (type: TypeOptions, title: string | JSX.Element, body: string | JSX.Element) => Id
  dismiss: (id: Id) => void
  dismissAll: () => void
  isActive: (id: Id) => boolean
}

export const AlertContext = createContext<AlertContextInterface | null>(null);

export function AlertProvider(props: any) {
  const iconMap: any = useMemo(() => ({
    info: (
        <div style={{marginTop: "0.3em"}}>
            <svg width="24" height="24" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.9995 9.5V11.5M11.9995 15.5H12.0095M5.07134 19.5H18.9277C20.4673 19.5 21.4296 17.8333 20.6598 16.5L13.7316 4.5C12.9618 3.16667 11.0373 3.16667 10.2675 4.5L3.33929 16.5C2.56949 17.8333 3.53174 19.5 5.07134 19.5Z" stroke="#419E6A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    ),
  }), [])
  
  const notify = useCallback((type: TypeOptions, title: string | JSX.Element, body: string | JSX.Element): Id => {
    return toast(
        <div className="alert-modal">
            <div className="alert-modal__title">{title}</div>
            <div className="alert-modal__body">{body}</div>
        </div>
    , {
        icon: iconMap[type],
        type,
    })
  }, [iconMap])

  const dismiss = useCallback((id: Id) => toast.dismiss(id), [])
  const dismissAll = useCallback(() => toast.dismiss(), [])
  const isActive = useCallback((id: Id) => toast.isActive(id), [])

  return <AlertContext.Provider value={{ notify, dismiss, dismissAll, isActive } as AlertContextInterface} {...props} />;
}
