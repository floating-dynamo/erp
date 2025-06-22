import { connectDB } from '@/lib/db';
import { Hono } from 'hono';
import UserModel from '../model';
import { 
  loginUserSchema, 
  registerUserSchema, 
  updateProfileSchema, 
  changePasswordSchema 
} from '../schemas';
import { sign, verify } from 'hono/jwt';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const app = new Hono()
  // Register endpoint
  .post('/register', async (c) => {
    try {
      await connectDB();
      
      const body = await c.req.json();
      const parsedData = registerUserSchema.parse(body);

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(parsedData.email);
      if (existingUser) {
        return c.json(
          { 
            success: false, 
            message: 'User with this email already exists' 
          }, 
          400
        );
      }

      // Create new user
      const newUser = new UserModel({
        email: parsedData.email,
        password: parsedData.password,
        name: parsedData.name,
        role: parsedData.role,
        companyId: parsedData.companyId
      });
      await newUser.save();

      return c.json(
        {
          success: true,
          message: 'User registered successfully',
        },
        201
      );
    } catch (error) {
      console.error('Registration error:', error);
      return c.json(
        {
          success: false,
          message: 'Error registering user',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  })

  // Login endpoint
  .post('/login', async (c) => {
    try {
      await connectDB();
      
      const body = await c.req.json();
      const { email, password } = loginUserSchema.parse(body);

      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return c.json(
          { 
            success: false, 
            message: 'Invalid email or password' 
          }, 
          401
        );
      }

      // Check if user is active
      if (!user.isActive) {
        return c.json(
          { 
            success: false, 
            message: 'Account is deactivated. Please contact administrator.' 
          }, 
          401
        );
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return c.json(
          { 
            success: false, 
            message: 'Invalid email or password' 
          }, 
          401
        );
      }

      // Generate JWT token
      const payload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
      };
      
      const token = await sign(payload, JWT_SECRET);

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Set HTTP-only cookie
      setCookie(c, 'auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24 hours
      });

      // Return user data (without password)
      const userData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        privileges: user.allPrivileges,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return c.json({
        success: true,
        message: 'Login successful',
        user: userData,
        token: token, // Also return token for localStorage fallback
      });
    } catch (error) {
      console.error('Login error:', error);
      return c.json(
        {
          success: false,
          message: 'Error during login',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        500
      );
    }
  })

  // Logout endpoint
  .post('/logout', async (c) => {
    try {
      // Clear the auth cookie
      deleteCookie(c, 'auth-token');
      
      return c.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return c.json(
        {
          success: false,
          message: 'Error during logout'
        },
        500
      );
    }
  })

  // Get current user profile
  .get('/profile', async (c) => {
    try {
      await connectDB();
      
      // Get token from cookie or Authorization header
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      // Verify JWT token
      const payload = await verify(token, JWT_SECRET);
      
      // Find user
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      // Check if user is still active
      if (!user.isActive) {
        return c.json(
          { 
            success: false, 
            message: 'Account is deactivated' 
          }, 
          401
        );
      }

      // Return user data (without password)
      const userData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        privileges: user.allPrivileges,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      return c.json({
        success: true,
        user: userData,
      });
    } catch (error) {
      console.error('Profile fetch error:', error);
      return c.json(
        {
          success: false,
          message: 'Error fetching user profile',
          error: error instanceof Error ? error.message : 'Invalid token'
        },
        401
      );
    }
  })

  // Update user profile
  .patch('/profile', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const body = await c.req.json();
      const parsedData = updateProfileSchema.parse(body);

      // Check if email is being changed and if it's already taken
      if (parsedData.email) {
        const existingUser = await UserModel.findByEmail(parsedData.email);
        if (existingUser && existingUser._id.toString() !== payload.userId) {
          return c.json(
            { 
              success: false, 
              message: 'Email is already taken by another user' 
            }, 
            400
          );
        }
      }

      // Update user
      const updatedUser = await UserModel.findByIdAndUpdate(
        payload.userId,
        parsedData,
        { new: true }
      );

      if (!updatedUser) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      return c.json({
        success: true,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Profile update error:', error);
      return c.json(
        {
          success: false,
          message: 'Error updating profile',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  })

  // Change password
  .post('/change-password', async (c) => {
    try {
      await connectDB();
      
      // Get token and verify user
      let token = getCookie(c, 'auth-token');
      if (!token) {
        const authHeader = c.req.header('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        return c.json(
          { 
            success: false, 
            message: 'No authentication token provided' 
          }, 
          401
        );
      }

      const payload = await verify(token, JWT_SECRET);
      const body = await c.req.json();
      const { currentPassword, newPassword } = changePasswordSchema.parse(body);

      // Find user
      const user = await UserModel.findById(payload.userId);
      if (!user) {
        return c.json(
          { 
            success: false, 
            message: 'User not found' 
          }, 
          404
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return c.json(
          { 
            success: false, 
            message: 'Current password is incorrect' 
          }, 
          400
        );
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return c.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      console.error('Password change error:', error);
      return c.json(
        {
          success: false,
          message: 'Error changing password',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        400
      );
    }
  });

export default app;