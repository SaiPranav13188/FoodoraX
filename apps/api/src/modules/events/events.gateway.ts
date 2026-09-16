import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { LocationUpdateSchema, LocationUpdateInput } from '@foodorax/validation';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'events',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinOrderRoom')
  handleJoinOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ): { event: string; room: string } {
    const roomName = `order_${data.orderId}`;
    client.join(roomName);
    this.logger.log(`Socket ${client.id} joined room ${roomName}`);
    return { event: 'joinedRoom', room: roomName };
  }

  @SubscribeMessage('leaveOrderRoom')
  handleLeaveOrderRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { orderId: string },
  ): { event: string; room: string } {
    const roomName = `order_${data.orderId}`;
    client.leave(roomName);
    this.logger.log(`Socket ${client.id} left room ${roomName}`);
    return { event: 'leftRoom', room: roomName };
  }

  @SubscribeMessage('updateDriverLocation')
  handleDriverLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: LocationUpdateInput,
  ): { status: string; errors?: any } {
    const parseResult = LocationUpdateSchema.safeParse(payload);
    if (!parseResult.success) {
      return { status: 'error', errors: parseResult.error.errors };
    }

    const { orderId, latitude, longitude, heading } = parseResult.data;
    const roomName = `order_${orderId}`;

    this.server.to(roomName).emit('driverLocationUpdated', {
      orderId,
      latitude,
      longitude,
      heading,
      timestamp: new Date().toISOString(),
    });

    return { status: 'success' };
  }

  broadcastOrderStatusChange(orderId: string, status: string, updatedNotification?: string): void {
    const roomName = `order_${orderId}`;
    this.server.to(roomName).emit('orderStatusChanged', {
      orderId,
      status,
      message: updatedNotification,
      timestamp: new Date().toISOString(),
    });
  }
}