import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // GET / - get the welcome message
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // GET /health - get the health of the backend
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TextSonar AI Backend',
      version: '1.0.0',
    };
  }
}
