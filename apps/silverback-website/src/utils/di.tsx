import React, { useContext } from 'react';

// TODO: Extract to shared module.

export const createDependencyContext = <T extends {}>(): [
  React.FC<{ dependencies: T }>,
  React.FC<{ dependencies: Partial<T> }>,
  () => T,
] => {
  const DependencyContext = React.createContext<T | {}>({});

  const DependencyProvider: React.FC<{ dependencies: T }> = ({
    dependencies,
    children,
  }) => {
    return (
      <DependencyContext.Provider value={dependencies}>
        {children}
      </DependencyContext.Provider>
    );
  };

  const error = new Error('Dependency context has not been initialised.');

  const DependencyOverride: React.FC<{ dependencies: Partial<T> }> = ({
    dependencies,
    children,
  }) => {
    const context = useContext(DependencyContext);
    if (!isInitialised(context)) {
      throw error;
    }
    return (
      <DependencyContext.Provider
        value={Object.assign({}, context, dependencies)}
      >
        {children}
      </DependencyContext.Provider>
    );
  };

  const useDependencies = (): T => {
    const context = useContext(DependencyContext);
    if (!isInitialised(context)) {
      throw error;
    }
    return context;
  };

  const isInitialised = (deps: T | {}): deps is T =>
    !!deps && Object.keys(deps).length > 0;

  return [DependencyProvider, DependencyOverride, useDependencies];
};
