import {useModal} from './use-modal';

interface ModalProps extends React.PropsWithChildren {
  resolver: CallableFunction;
}

export const Modal: React.FC<ModalProps> = ({resolver}) => {
  const {vnode} = useModal(resolver);
  return vnode;
};
