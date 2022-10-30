import { bootstrap } from './bootstrap';

void bootstrap().then((app) => {
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => void app.close());
  }
});
