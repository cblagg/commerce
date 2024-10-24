'use client';

import { useRouter } from 'next/navigation';

function useUpdateURL() {
  const router = useRouter();

  return (state: Record<string, string>) => {
    const newParams = new URLSearchParams(window.location.search);
    Object.entries(state).forEach(([key, value]: [string, string]) => {
      newParams.set(key, value);
    });
    router.push(`?${newParams.toString()}`, { scroll: false });
  };
}

const VALUES = [
  0,
  50,
  100,
  200,
  500,
  1000
];

const PriceSelector = ({
  param,
  label,
  minimumValue,
  maximumValue,
  value,
}: {
  param: string;
  label: string;
  minimumValue: string;
  maximumValue: string;
  value: string;
}) => {
  const updateURL = useUpdateURL();
  return (
    <label style={{ display: 'flex', alignItems: 'center' }} className="flex text-neutral-500 md:block dark:text-neutral-400">
      <div className='text-xs'>
      {label}
      </div>
      <div className="text-s text-neutral-0 md:block dark:text-neutral-0">
        <select onChange={(e) => {
          updateURL({ [param]: e.target.value })
        }} value={parseFloat(value) || ''}>
          {
            VALUES.map(value => (
              <option
                key={value}
                value={value}
                disabled={
                  (param === 'min' && value > parseFloat(maximumValue)) ||
                  (param === 'max' && value < parseFloat(minimumValue))
                }
              >
                ${value}
              </option>
            ))
          }
        </select>
      </div>
    </label>
  );
};

export default PriceSelector;