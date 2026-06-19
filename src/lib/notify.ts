import toast from 'react-hot-toast';

function isErrorMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('failed') ||
    m.includes('error') ||
    m.includes('could not') ||
    m.includes('cannot') ||
    m.includes('please ') ||
    m.includes('required') ||
    m.includes('blocked') ||
    m.includes('not supported') ||
    m.includes('no resume') ||
    m.includes('no meeting') ||
    m.includes('select ') ||
    m.includes('approval failed') ||
    m.includes('rejection failed')
  );
}

function isSuccessMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('success') ||
    m.includes('saved') ||
    m.includes('sent') ||
    m.includes('updated') ||
    m.includes('created') ||
    m.includes('approved') ||
    m.includes('completed') ||
    m.includes('deleted') ||
    m.includes('submitted') ||
    m.includes('uploaded') ||
    m.includes('assigned') ||
    m.includes('verified') ||
    m.includes('rejected') ||
    m.includes('credentials') ||
    m.includes('scheduled') ||
    m.includes('marked as paid')
  );
}

/** Drop-in replacement for window.alert — shows a styled toast instead. */
export function notify(message: string) {
  if (isErrorMessage(message)) {
    toast.error(message);
  } else if (isSuccessMessage(message)) {
    toast.success(message);
  } else {
    toast(message);
  }
}

export function notifySuccess(message: string) {
  toast.success(message);
}

export function notifyError(message: string) {
  toast.error(message);
}
