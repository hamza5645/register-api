import { Body, Controller, Post, HttpCode, HttpStatus, Patch, Param, ParseIntPipe, Delete, Get, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthDto, UpdateUserDto } from './dto';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@ApiTags('auth')
@ApiBearerAuth('access-token')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Signup a new user' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })

  @Post('signup')
  signup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @ApiOperation({ summary: 'Signin a user and get token' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 200, description: 'The user has been successfully signed in.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the current user with profile fields.' })
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: Request) {
    const user = req.user as { sub: number };
    return this.authService.getUserById(user.sub);
  }

  @ApiOperation({ summary: 'Update a user by id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 403, description: 'Email already in use.' })
  @UseGuards(AuthGuard('jwt'))
  @Patch('users/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const user = req.user as { sub: number };
    if (!user || user.sub !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.authService.updateUser(id, dto);
  }

  @ApiOperation({ summary: 'Delete a user by id' })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard('jwt'))
  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const user = req.user as { sub: number };
    if (!user || user.sub !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    return this.authService.deleteUser(id);
  }

  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Returns an array of users.' })
  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  listUsers() {
    return this.authService.listUsers();
  }

  @ApiOperation({ summary: 'Get a user by id' })
  @ApiResponse({ status: 200, description: 'Returns the user.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(AuthGuard('jwt'))
  @Get('users/:id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.authService.getUserById(id);
  }
}
