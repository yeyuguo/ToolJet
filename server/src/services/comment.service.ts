import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not } from 'typeorm';

import { Comment } from '../entities/comment.entity';
import { CommentRepository } from '../repositories/comment.repository';
import { CreateCommentDTO } from '../dto/create-comment.dto';

// import { UsersService } from 'src/services/users.service';
// import { User } from '../entities/user.entity';

// createComment(): Create a new comment
// getComments(): Get all created comments
// getComment(): Retrieve the details of a single comment
// editComment(): Edit the details of a particular comment
// deleteComment(): Delete a single comment
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(CommentRepository)
    private commentRepository: CommentRepository
  ) {}

  public async createComment(createCommentDto: CreateCommentDTO, id: string, organizationId: string): Promise<Comment> {
    return await this.commentRepository.createComment(createCommentDto, id, organizationId);
  }

  public async getComments(threadId: string, currentVersionId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: {
        threadId,
        currentVersionId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  public async getOrganizationComments(organizationId: string): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: {
        organizationId,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  public async getNotifications(appId: string, userId: string, isResolved = false): Promise<Comment[]> {
    return await this.commentRepository.find({
      where: {
        userId: Not(userId),
        thread: { appId, isResolved },
      },
      relations: ['thread'],
    });
  }

  public async getComment(commentId: number): Promise<Comment> {
    const foundComment = await this.commentRepository.findOne(commentId);
    if (!foundComment) {
      throw new NotFoundException('Comment not found');
    }
    return foundComment;
  }

  public async editComment(commentId: number, createCommentDto: CreateCommentDTO): Promise<Comment> {
    const editedComment = await this.commentRepository.findOne(commentId);
    if (!editedComment) {
      throw new NotFoundException('Comment not found');
    }
    return this.commentRepository.editComment(createCommentDto, editedComment);
  }

  public async deleteComment(commentId: number): Promise<void> {
    await this.commentRepository.delete(commentId);
  }
}