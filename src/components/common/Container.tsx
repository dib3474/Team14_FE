interface ContainerProps {
  children: React.ReactNode;
}
const Container = ({ children }: ContainerProps) => (
  <div className="ui-shell">
    <main id="main-content" className="ui-canvas ui-width">
      {children}
    </main>
  </div>
);
export default Container;
