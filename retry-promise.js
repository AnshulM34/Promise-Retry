/**
 *
 * @param {function} promiseFunction promise function being executed with retry
 * @param {object} config - configure retrying with properties (startDelay in miliseconds , numOfRetry in number and errorStatus as aray of status to monitor)
 *
 */

const DEFAULT_NUM_OF_RETRY = 3;
const DEFAULT_DELAY = 500;

export const retryPromise = (promiseFunction, config) => {
  let { startDelay, numOfRetry, errorStatus } = config || { startDelay: DEFAULT_DELAY, numOfRetry: DEFAULT_NUM_OF_RETRY };
  startDelay = startDelay || DEFAULT_DELAY;
  numOfRetry = numOfRetry || DEFAULT_NUM_OF_RETRY;
  let retryCount = 1;
  const calculateExponentialDelay = (retryCount) => {
     const baseValue  = (startDelay + retryCount * 500) / 1000;
     return (baseValue ** 2) * 1000;
  }
  const retry = () => new Promise((resolve, reject) => 
    promiseFunction()
      .then(resolve)
      .catch((error) => { 
        if (retryCount === numOfRetry) {
          reject(new Error(`The api failed to execute after retrying ${NUM_OF_RETRY} times with error ${error}`));
        } else if ((error && error.status >= 500) || (errorStatus && error && (errorStatus.indexOf(error.status) !== -1))) {
          const delayValue = calculateExponentialDelay(retryCount);
          setTimeout(() => {
            retryCount ++;
            retry().then(resolve, reject);
          }, delayValue);
        } else {
          reject(error);
        }
    }));

  return retry();
}