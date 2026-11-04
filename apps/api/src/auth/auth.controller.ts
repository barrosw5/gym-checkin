import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    const token = await this.authService.login(user);

    // Set the JWT as an HttpOnly cookie
    res.cookie('Authentication', token.access_token, {
      httpOnly: true, // JS cannot read it
      secure: false, // Set to true in production (HTTPS)
      sameSite: 'lax',
    });

    return { message: 'Login successful', user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.authService.getProfile(userId);
  }
}
