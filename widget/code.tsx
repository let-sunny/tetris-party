/* eslint-disable react/react-in-jsx-scope */
const { widget } = figma;
const { useEffect, Text } = widget;

function Widget() {
  useEffect(() => {
    figma.ui.on('message', (msg) => {
      if (msg === 'hello') {
        // figma.notify(`Hello Widgets`);
      }
      if (msg === 'close') {
        figma.closePlugin();
      }
    });
  });

  return (
    <Text
      fontSize={24}
      onClick={
        // Use async callbacks or return a promise to keep the Iframe window
        // opened. Resolving the promise, closing the Iframe window, or calling
        // "figma.closePlugin()" will terminate the code.
        () =>
          new Promise((_resolve) => {
            figma.showUI(__html__);
            figma.ui.resize(300, 600);
          })
      }
    >
      Start Tetris
    </Text>
  );
}

widget.register(Widget);
