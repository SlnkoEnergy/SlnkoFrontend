import { useEffect, useRef } from "react";
import CountUp from "react-countup";

const AnimatedNumber = ({ value }) => {
  const countUpRef = useRef(null);
  const prevValueRef = useRef(value);
  const isInteger = Number.isInteger(value);

  useEffect(() => {
    if (countUpRef.current && prevValueRef.current !== value) {
      countUpRef.current.update(value);
      prevValueRef.current = value;
    }
  }, [value]);

  return (
    <CountUp
      start={prevValueRef.current}
      end={value}
      duration={1.2}
      separator=","
      decimals={isInteger ? 0 : 2}
      preserveValue
      ref={(el) => {
        if (el) countUpRef.current = el;
      }}
    />
  );
};

export default AnimatedNumber;
