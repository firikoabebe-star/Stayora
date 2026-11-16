"use client";

import { Star, Shield, Award, MessageCircle } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface HostProfileProps {
  host: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    createdAt: string;
  };
}

export default function HostProfile({ host }: HostProfileProps) {
  const joinYear = new Date(host.createdAt).getFullYear();

  return (
    <div className="flex items-start gap-4 pb-8 border-b border-gray-200">
      {/* Host Avatar */}
      <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
        {host.avatar ? (
          <Image
            src={host.avatar}
            alt={`${host.firstName} ${host.lastName}`}
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : (
          <span className="text-xl font-semibold text-gray-600">
            {host.firstName[0]}
          </span>
        )}
      </div>

      {/* Host Info */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Hosted by {host.firstName}
        </h3>

        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>Joined in {joinYear}</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>4.9 rating</span>
          </div>
          <span>127 reviews</span>
        </div>

        {/* Host Badges */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>Identity verified</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>Superhost</span>
          </div>
        </div>

        {/* Host Description */}
        <p className="text-gray-600 mb-4">
          {host.firstName} is a Superhost. Superhosts are experienced, highly
          rated hosts who are committed to providing great stays for guests.
        </p>

        {/* Response Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-6">
          <div>
            <div className="font-medium text-gray-900">Response rate: 100%</div>
            <div className="text-gray-600">Responds to all messages</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">
              Response time: within an hour
            </div>
            <div className="text-gray-600">Usually responds quickly</div>
          </div>
        </div>

        {/* Contact Button */}
        <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-xl hover:border-gray-400 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>Contact Host</span>
        </button>
      </div>
    </div>
  );
}
