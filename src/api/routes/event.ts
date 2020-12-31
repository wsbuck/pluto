import { Router } from 'express';
import MessageService from '../../services/message';

const route = Router();
const messageService = new MessageService();

route.post('/', async (req, res) => {
  res.status(200).send('');
  const { event, challenge } = req.body;
  console.log('req.body', req.body);

  switch (event?.type) {
    case 'app_mention': {
      try {
        messageService.read(event);
      } catch (e) {
        console.error('error', e);
      }
      break;
    }
    default: {
      console.log('nothing');
    }
  }
  
  if (challenge) {
    return res.json({ challenge });
  }

});

export default route;
