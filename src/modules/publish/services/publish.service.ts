import { Injectable } from '@nestjs/common';

@Injectable()
export class PublishService {
  async publish(data: any) {
    return {
      success: true,
      message: '内容发布成功',
      publishId: `pub_${Date.now()}`,
      ...data
    };
  }
}
