import {router, usePage} from '@inertiajs/react';
import {useEffect, useState, ReactNode} from 'react';
import axios from 'axios';

export function useModal(resolverCallback: CallableFunction | null = null) {
  const modal = usePage().props?.modal;
  const props = modal?.props;
  const key = modal?.key;

  const [show, setShow] = useState<boolean>(false);
  const [vnode, setVnode] = useState<ReactNode>(<></>);
  const [nonce, setNonce] = useState<string | null>();

  const resolver = resolverCallback !== null ? resolverCallback : globalThis.resolveMomentumModal;

  const setHeaders = (values: Record<string, string | null>) => {
    Object.entries(values).forEach(([key, value]) =>
      ['post', 'put', 'patch', 'delete'].forEach((method) => {
        /** @ts-ignore */
        axios.defaults.headers[method][key] = value;
      })
    );
  };

  const resetHeaders = () => {
    const headers = ['X-Inertia-Modal-Key', 'X-Inertia-Modal-Redirect'];

    /** @ts-ignore */
    headers.forEach(([key, value]) =>
      ['get', 'post', 'put', 'patch', 'delete'].forEach((method) => {
        /** @ts-ignore */
        delete axios.defaults.headers[method][key];
      })
    );
  };

  const updateHeaders = () => {
    setHeaders({
      'X-Inertia-Modal-Key': key,
      'X-Inertia-Modal-Redirect': modal?.redirectURL,
    });

    axios.defaults.headers.get['X-Inertia-Modal-Redirect'] = modal?.redirectURL ?? '';
  };

  const close = () => {
    setShow(false);
    resetHeaders();
  };

  const resolveComponent = () => {
    if (typeof resolver !== 'function') {
      throw Error("Resolver function not defined. You have to define it at Inertia's entrypoint.");
    }
    if (nonce == modal?.nonce || !modal?.component) {
      return close();
    }

    const component = modal?.component ? resolver(modal.component) : null;

    setNonce(modal?.nonce);
    if (component) {
      const ComponentToRender = component.default;
      setVnode(<ComponentToRender key={key} {...props} />);
    } else {
      setVnode('');
    }

    setShow(true);
  };

  useEffect(() => {
    resolveComponent();

    const handlePopState = () => setNonce(null);

    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (modal?.nonce !== nonce) {
      resolveComponent();
    }
  }, [modal]);

  useEffect(updateHeaders, [key]);

  const redirect = () => {
    var redirectURL = modal?.redirectURL ?? modal?.baseURL;

    setVnode(false);

    if (!redirectURL) {
      return;
    }

    return router.visit(redirectURL, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  return {
    show,
    vnode,
    close,
    redirect,
    props,
  };
}
