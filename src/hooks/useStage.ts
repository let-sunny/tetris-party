import { useState, useEffect } from 'react';

export const useStage = () => {
  const [score, setScore] = useState(0);

  return { score };
};
