import { Router } from 'express';
import MessageService from '../../services/message';
import { IInterpretMessageValue } from '../../interfaces/IInterpretMessageValue';

const route = Router();
const messageService = new MessageService();

route.post('/', async (req, res) => {
  res.json({}).status(200);
  const { event, challenge } = req.body;

  switch (event.type) {
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
