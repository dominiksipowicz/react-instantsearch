import React, { useEffect, useRef, useState } from 'react';
import { useSearchBox } from 'react-instantsearch-hooks';

import { ControlledSearchBox } from './ControlledSearchBox';

export function SearchBox(props) {
  const { query, refine, isSearchStalled } = useSearchBox(props);
  const [value, setValue] = useState(query);
  const inputRef = useRef(null);

  function onReset() {
    setValue('');
  }

  function onChange(event) {
    setValue(event.currentTarget.value);
  }

  useEffect(() => {
    refine(value);
  }, [refine, value]);

  useEffect(() => {
    if (query !== value) {
      setValue(query);
    }
    // We want to track when the query coming from InstantSearch.js changes
    // to update the React state, so we don't need to track the state value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  return (
    <ControlledSearchBox
      className={props.className}
      inputRef={inputRef}
      isSearchStalled={isSearchStalled}
      onChange={onChange}
      onReset={onReset}
      placeholder={props.placeholder}
      value={value}
    />
  );
}
